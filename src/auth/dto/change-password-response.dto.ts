export class ChangePasswordResponseDto {
  constructor(change: boolean) {
    this.change = change;
  }

  change: boolean;
}
