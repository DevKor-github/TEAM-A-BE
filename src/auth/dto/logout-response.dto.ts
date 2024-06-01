export class LogoutResponseDto {
  constructor(logout: boolean) {
    this.logout = logout;
  }

  logout: boolean;
}
