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
    // TODOs 1: Define seeds and fees
    const SEED: vector<u8> = b"";
    const UPLOAD_FEE: u64 = 0; // This should be in microMOVE to the exponential of the MOVE decimlal

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_DOCUMENT_NOT_FOUND: u64 = 2;
    const E_ALREADY_SIGNED: u64 = 3;
    const E_NOT_ALLOWED_TO_SIGN: u64 = 4;
    const E_DOCUMENT_ALREADY_EXISTS: u64 = 5;
    const E_INSUFFICIENT_FUNDS: u64 = 6;
    const E_SIGNER_NOT_FOUND: u64 = 7;

    // Struct to store document metadata
    // TODOs 2: create a struct for the document metadata which has the following filds:
    // - id
    // - name
    // - ipfs_hash
    // - created_at
    // - owner
    // - signatures: This should be a vector of addresses
    // - allowed_signers: This should be a vector of addresses
    struct Document has store, drop, copy {

    }

    // Struct to manage the resource account and state
    // TODOs 3: create a struct for global state store in the resource account created which has the following fields:
    // - admin: This should be the address of the admin
    // - documents: This should be a table of documents
    // - doc_counter: This should be a u64 which tracks the total documents
    // - document_vec: This should be a vector of documents for iteration
    // - upload_events: This should be an event handle for upload events
    // - sign_events: This should be an event handle for sign events
    // - share_events: This should be an event handle for share events
    struct DocState has key {

    }

    // Struct to store the resource account's SignerCapability
    struct ResourceAccountCap has key {
        signer_cap: account::SignerCapability,
    }

    // Events
    // TODOs 4: create events for upload, sign and share events
    // - UploadEvent: This should have the following fields:
    //   - id: This should be the document id
    //   - name: This should be the document name
    //   - ipfs_hash: This should be the document ipfs hash
    //   - owner: This should be the address of the owner
    //   - created_at: This should be the timestamp of the upload
    #[event]
    struct UploadEvent has drop, store {
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
    // TODOs 5: create a function to initialize the module which takes the admin address as input
    // - Create a resource account for the module
    // - Register the resource account for APT
    // - Initialize the DocState under the resource account
    // - Store the SignerCapability under the admin's address
    fun init_module(admin: &signer) {
       
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

        // TODOs 9: Check if the user has enough APT to pay for the upload fee and make the payment

        // TODOs 10: Created document from struct, add the document to the table and vector, increment the document counter and emit the upload event
        // Create document
        // Owner can sign by default
        let document = Document {
        };
    }

    // Add a signer to a document
    // TODOs 11: create a function to add a signer to a document which takes the following inputs:
    // - owner: This should be the address of the owner
    // - id: This should be the document id
    // - new_signer: This should be the address of the new signer
    public entry fun add_signer(
        owner: &signer,
        id: String,
        new_signer: address
    ) acquires DocState, ResourceAccountCap {
        let state = borrow_global_mut<DocState>(get_resource_address());
        assert_document_exists(state, &id);

        // Borrow the document from the table
        let document_table = table::borrow_mut(&mut state.documents, id);

        // - Check if the document exists
        // - Check if the owner is authorized
        // - Check if the new signer is not already in the allowed signers
        // - Add the new signer to the allowed signers
        // - Emit the share event
    }

    // Sign a document
    // TODOs 12: create a function to sign a document which takes the following inputs:
    // - signer_acc: This should be the address of the signer
    // - id: This should be the document id
    public entry fun sign_document(
        signer_acc: &signer,
        id: String
    ) acquires DocState, ResourceAccountCap {
        let signer_addr = signer::address_of(signer_acc);
        let state = borrow_global_mut<DocState>(get_resource_address());

        // Check if the document exists
 
        // Borrow the document from the table
        let document_table = table::borrow_mut(&mut state.documents, id);

        // Find the document in the vector

        // Borrow the document from the vector

        // Assert the signer is allowed and hasn't already signed

        // Update signatures in both the table and vector

        // Emit sign event

    }

    // Remove a signer from a document
    // TODOs 13: create a function to remove a signer from a document which takes the following inputs:
    // - owner: This should be the address of the owner
    // - id: This should be the document id
    // - remove_signer: This should be the address of the signer to be removed
    public entry fun remove_signer(
        owner: &signer,
        id: String,
        remove_signer: address
    ) acquires DocState, ResourceAccountCap {
        let state = borrow_global_mut<DocState>(get_resource_address());
        assert_document_exists(state, &id);

        // Borrow the document from the table

        // Find the document in the vector and error if not found

        // Borrow the document from the vector

        // Assert the owner is authorized

        // Remove the signer from both the table and vector if present
    }

    // Helper Functions
    // TODOs 6: create a function to get the resource address of the module
    fun get_resource_address(): address acquires ResourceAccountCap {
        @0x0
    }

    // TODOs 7: create a function to check if the document exists in the table
    fun assert_document_exists(state: &DocState, id: &String) {
    }

    // TODOs 8: create a function to assert the owner of the document
    fun assert_is_owner(document: &Document, account: &signer) {
        
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
    // TODOs 14: create a view function to get the document metadata by id
    #[view]
    public fun get_document(id: String): (String, String, u64, address, vector<address>, vector<address>) acquires DocState, ResourceAccountCap {
    }

    // Get all documents a user is allowed to sign
    // TODOs 15: create a view function to get all documents a user is allowed to sign
    #[view]
    public fun get_documents_for_signer(
        user_addr: address
    ): vector<Document> acquires DocState, ResourceAccountCap {
  
    }


    // Get all documents a user own
    // TODOs 16: create a view function to get all documents a user owns
    #[view]
    public fun get_documents_by_signer(
        user_addr: address
    ): vector<Document> acquires DocState, ResourceAccountCap {
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