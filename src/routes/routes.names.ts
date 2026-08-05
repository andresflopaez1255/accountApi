enum Routes {
  home = '/',
  //categorias
  categories = '/categories',
  addCategory = '/new_category',
  updateCategory = '/update_category',
  deleteCategory = '/delete_category',
  //users
  users = '/users',
  addUser = '/new_user',
  updateUser = '/update_user',
  deleteUser = '/delete_user',
  searchUser = '/search_user',
  //accounts
  accounts = '/accounts',
  addAccount = '/new_account',
  updateAccount = '/update_account',
  deleteAccount = '/delete_account',
  searchAccount = '/search_account',
  // auth vendors
  register_vendors = '/sign_in_vendors',
  logIn_vendor ='/log_in_vendors',
  recovery_vendors = '/recovery_vendors',
  sales = '/sales',
  addSale = '/new_sale',
  updateSale = '/update_sale',
  deleteSale = '/delete_sale',
  providers = '/providers',
  addProvider = '/new_provider',
  updateProvider = '/update_provider',
  deleteProvider = '/delete_provider',
  incidents = '/incidents',
  addIncident = '/new_incident',
  updateIncident = '/update_incident',
  deleteIncident = '/delete_incident',
  products = '/products',
  addProduct = '/new_product',
  updateProduct = '/update_product',
  deleteProduct = '/delete_product',
  businessSummary = '/business_summary',
  clientHistory = '/client_history'
}

export default Routes;
