export interface IUserUpdates {
  data: {
    uuid: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    isAdmin?: boolean;
  };
}
