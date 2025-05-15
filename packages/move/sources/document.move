module document_management::secure_docs {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::option;
    use aptos_framework::account::{Self};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_std::table::{Self, Table};

    // Constants
    const SEED: vector<u8> = b"secure_docs";
    const UPLOAD_FEE: u64 = 5000000; // 0.05 APT (in microAPT, 1 APT = 10^8 microAPT)

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_DOCUMENT_NOT_FOUND: u64 = 2;
    const E_ALREADY_SIGNED: u64 = 3;
    const E_NOT_ALLOWED_TO_SIGN: u64 = 4;
    const E_DOCUMENT_ALREADY_EXISTS: u64 = 5;
    const E_INSUFFICIENT_FUNDS: u64 = 6;
    const E_SIGNER_NOT_FOUND: u64 = 7;

    // Struct to store document metadata
    struct Document has store, drop, copy {
        id: String,              // Unique document ID
        name: String,            // Document name
        ipfs_hash: String,       // IPFS hash for off-chain storage
        created_at: u64,         // Timestamp of creation
        owner: address,          // Document owner
        signatures: vector<address>, // List of signers
        allowed_signers: vector<address>, // Users allowed to sign
    }

    // Struct to manage the resource account and state
    struct DocState has key {
        admin: address,
        documents: Table<String, Document>, // Maps document ID to Document
        doc_counter: u64,          // Tracks total documents
        document_vec: vector<Document>, // Vector of documents for iteration
        upload_events: EventHandle<UploadEvent>,
        sign_events: EventHandle<SignEvent>,
        share_events: EventHandle<ShareEvent>,
    }

    // Struct to store the resource account's SignerCapability
    struct ResourceAccountCap has key {
        signer_cap: account::SignerCapability,
    }

    // Events
    #[event]
    struct UploadEvent has drop, store {
        id: String,
        name: String,
        ipfs_hash: String,
        owner: address,
        created_at: u64,
    }

    #[event]
    struct SignEvent has drop, store {
        id: String,
        signer: address,
    }

    #[event]
    struct ShareEvent has drop, store {
        id: String,
        allowed_signer: address,
    }

    // Initialize the module
    fun init_module(admin: &signer) {
        let admin_addr = signer::address_of(admin);

        // Create resource account
        let (resource_signer, signer_cap) = account::create_resource_account(admin, SEED);
        let resource_addr = signer::address_of(&resource_signer);

        // Register resource account for APT
        if (!coin::is_account_registered<AptosCoin>(resource_addr)) {
            coin::register<AptosCoin>(&resource_signer);
        };

        // Initialize DocState under resource account
        move_to(&resource_signer, DocState {
            admin: admin_addr,
            documents: table::new(),
            doc_counter: 0,
            document_vec: vector::empty(),
            upload_events: account::new_event_handle<UploadEvent>(&resource_signer),
            sign_events: account::new_event_handle<SignEvent>(&resource_signer),
            share_events: account::new_event_handle<ShareEvent>(&resource_signer),
        });

        // Store SignerCapability under admin's address
        move_to(admin, ResourceAccountCap {
            signer_cap,
        });
    }

    // Upload a document (with payment)
    public entry fun upload_document(
        user: &signer,
        name: String,
        ipfs_hash: String,
        id: String
    ) acquires DocState, ResourceAccountCap {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<DocState>(get_resource_address());

        // Check for uniqueness
        assert!(!table::contains(&state.documents, id), error::already_exists(E_DOCUMENT_ALREADY_EXISTS));

        // Handle payment
        assert_user_has_enough_apt(user_addr, UPLOAD_FEE);
        let payment = coin::withdraw<AptosCoin>(user, UPLOAD_FEE);
        coin::deposit<AptosCoin>(get_resource_address(), payment);

        // Create document
        let document = Document {
            id,
            name,
            ipfs_hash,
            created_at: timestamp::now_seconds(),
            owner: user_addr,
            signatures: vector::empty(),
            allowed_signers: vector::singleton(user_addr), // Owner can sign by default
        };

        table::add(&mut state.documents, id, document);
        vector::push_back(&mut state.document_vec, document);
        state.doc_counter = state.doc_counter + 1;

        // Emit upload event
        event::emit_event(&mut state.upload_events, UploadEvent {
            id,
            name,
            ipfs_hash,
            owner: user_addr,
            created_at: timestamp::now_seconds(),
        });
    }

    // Add a signer to a document
    public entry fun add_signer(
        owner: &signer,
        id: String,
        new_signer: address
    ) acquires DocState, ResourceAccountCap {
        let state = borrow_global_mut<DocState>(get_resource_address());
        assert_document_exists(state, &id);

        // Borrow the document from the table
        let document_table = table::borrow_mut(&mut state.documents, id);

        // Find the document in the vector
        let (found, i) = vector::index_of(&state.document_vec, document_table);
        assert!(found, error::not_found(E_DOCUMENT_NOT_FOUND));

        // Borrow the document from the vector
        let document_vec = vector::borrow_mut(&mut state.document_vec, i);

        // Assert the owner is authorized
        assert_is_owner(document_table, owner);

        // Add the new signer to both the table and vector if not already present
        if (!vector::contains(&document_table.allowed_signers, &new_signer)) {
            // Update the table's document
            vector::push_back(&mut document_table.allowed_signers, new_signer);

            // Update the vector's document
            vector::push_back(&mut document_vec.allowed_signers, new_signer);

            // Emit the share event
            event::emit_event(&mut state.share_events, ShareEvent {
                id: id,
                allowed_signer: new_signer,
            });
        }
    }

    // Sign a document
    public entry fun sign_document(
        signer_acc: &signer,
        id: String
    ) acquires DocState, ResourceAccountCap {
        let signer_addr = signer::address_of(signer_acc);
        let state = borrow_global_mut<DocState>(get_resource_address());
        assert_document_exists(state, &id);

        // Borrow the document from the table
        let document_table = table::borrow_mut(&mut state.documents, id);

        // Find the document in the vector
        let (found, i) = vector::index_of(&state.document_vec, document_table);
        assert!(found, error::not_found(E_DOCUMENT_NOT_FOUND));

        // Borrow the document from the vector
        let document_vec = vector::borrow_mut(&mut state.document_vec, i);

        // Assert the signer is allowed and hasn't already signed
        assert_allowed_to_sign(document_table, signer_addr);
        assert_not_already_signed(document_table, signer_addr);

        // Update signatures in both the table and vector
        vector::push_back(&mut document_table.signatures, signer_addr);
        vector::push_back(&mut document_vec.signatures, signer_addr);

        // Emit sign event
        event::emit_event(&mut state.sign_events, SignEvent {
            id,
            signer: signer_addr,
        });
    }

    // Remove a signer from a document
    public entry fun remove_signer(
        owner: &signer,
        id: String,
        remove_signer: address
    ) acquires DocState, ResourceAccountCap {
        let state = borrow_global_mut<DocState>(get_resource_address());
        assert_document_exists(state, &id);

        // Borrow the document from the table
        let document_table = table::borrow_mut(&mut state.documents, id);

        // Find the document in the vector
        let (found, i) = vector::index_of(&state.document_vec, document_table);
        assert!(found, error::not_found(E_DOCUMENT_NOT_FOUND));

        // Borrow the document from the vector
        let document_vec = vector::borrow_mut(&mut state.document_vec, i);

        // Assert the owner is authorized
        assert_is_owner(document_table, owner);

        // Remove the signer from both the table and vector if present
        let (found, index) = vector::index_of(&document_table.allowed_signers, &remove_signer);
        if (found) {
            vector::remove(&mut document_table.allowed_signers, index);
            vector::remove(&mut document_vec.allowed_signers, index);
        } else {
            abort error::not_found(E_SIGNER_NOT_FOUND);
        };
    }

    // Helper Functions
    fun get_resource_address(): address acquires ResourceAccountCap {
        let cap = borrow_global<ResourceAccountCap>(@document_management);
        account::get_signer_capability_address(&cap.signer_cap)
    }

    fun assert_document_exists(state: &DocState, id: &String) {
        assert!(table::contains(&state.documents, *id), error::not_found(E_DOCUMENT_NOT_FOUND));
    }

    fun assert_is_owner(document: &Document, account: &signer) {
        assert!(document.owner == signer::address_of(account), error::permission_denied(E_NOT_AUTHORIZED));
    }

    fun assert_allowed_to_sign(document: &Document, signer_addr: address) {
        assert!(vector::contains(&document.allowed_signers, &signer_addr), error::permission_denied(E_NOT_ALLOWED_TO_SIGN));
    }

    fun assert_not_already_signed(document: &Document, signer_addr: address) {
        assert!(!vector::contains(&document.signatures, &signer_addr), error::invalid_state(E_ALREADY_SIGNED));
    }

    fun assert_user_has_enough_apt(user_addr: address, amount: u64) {
        assert!(coin::balance<AptosCoin>(user_addr) >= amount, error::invalid_state(E_INSUFFICIENT_FUNDS));
    }

    // View Functions
    #[view]
    public fun get_document(id: String): (String, String, u64, address, vector<address>, vector<address>) acquires DocState, ResourceAccountCap {
        let state = borrow_global<DocState>(get_resource_address());
        assert_document_exists(state, &id);

        let doc = table::borrow(&state.documents, id);
        (doc.name, doc.ipfs_hash, doc.created_at, doc.owner, doc.signatures, doc.allowed_signers)
    }

    // Get all documents a user is allowed to sign
    #[view]
    public fun get_documents_for_signer(
        user_addr: address
    ): vector<Document> acquires DocState, ResourceAccountCap {
        let state = borrow_global<DocState>(get_resource_address());
        let result = vector::empty<Document>();
        let len = vector::length(&state.document_vec);
        let i = 0;

        while (i < len) {
            let doc = vector::borrow(&state.document_vec, i);
            if (vector::contains(&doc.allowed_signers, &user_addr)) {
                vector::push_back(&mut result, *doc);
            };
            i = i + 1;
        };

        result
    }


    // Get all documents a user own
    #[view]
    public fun get_documents_by_signer(
        user_addr: address
    ): vector<Document> acquires DocState, ResourceAccountCap {
        let state = borrow_global<DocState>(get_resource_address());
        let result = vector::empty<Document>();
        let len = vector::length(&state.document_vec);
        let i = 0;

        while (i < len) {
            let doc = vector::borrow(&state.document_vec, i);
            if (doc.owner == user_addr) {
                vector::push_back(&mut result, *doc);
            };
            i = i + 1;
        };

        result
    }

    #[view]
    public fun get_document_count(): u64 acquires DocState, ResourceAccountCap {
        let state = borrow_global<DocState>(get_resource_address());
        state.doc_counter
    }

    #[view]
    public fun is_signed_by(id: String, signer_addr: address): bool acquires DocState, ResourceAccountCap {
        let state = borrow_global<DocState>(get_resource_address());
        assert_document_exists(state, &id);

        let doc = table::borrow(&state.documents, id);
        vector::contains(&doc.signatures, &signer_addr)
    }

    #[view]
    public fun get_upload_fee(): u64 {
        UPLOAD_FEE
    }
}