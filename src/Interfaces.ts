export  interface infoMessage {
    id:              number;
    id_user:         number;
    email_account:   string;
    pass_account:    string;
    name_profile:    string;
    code_profile:    number;
    id_category:     number;
    expiration_date: string;
    category:        string;
    name_user:      string;
    cellphone_user:  string;
    category_name:        string;
}

export interface Account {
  id?: string;
  id_user: string;
  email_account: string;
  pass_account: string;
  name_profile: string;
  code_profile: number;
  id_category: string;
  expiration_date: string;
}
