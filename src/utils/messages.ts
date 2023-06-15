enum  MessagesUsers {
    created = 'user created succesfully',
    updated = 'user updated succesfully',
    deleted = 'user deleted',
    successful = 'users found successfully',
    notSuccessful = 'users not found',
    error = 'an error occurred'
}

enum MessagesCategories {
    created = 'category created successfully',
    updated = 'category updated succesfully',
    deleted = 'category deleted',
    successful = 'categories found successfully',
    notSuccessful = 'categories not found',
    error = 'an error occurred'
} 


enum MessagesAccounts {
    created = 'account created successfully',
    updated = 'account updated succesfully',
    deleted = 'account deleted',
    successful = 'accounts found successfully',
    notSuccessful = 'accounts not found',
    error = 'an error occurred'
} 

enum MessagesAuth {
    created = 'vendor created successfully',
    updated = 'vendor updated succesfully',
    deleted = 'vendor deleted',
    successful = 'vendors found successfully',
    notSuccessful = 'vendor not found',
    vendorAlreadyExists = "vendor already exist",
    error = 'an error occurred'
} 

export {
	MessagesAccounts,
	MessagesUsers,
	MessagesCategories,
    MessagesAuth
}


