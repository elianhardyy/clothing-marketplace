export class RegisterResponseDto {
  name: string = '';
  email: string = '';
  role: string[] = [];
}

export class LoginResponseDto {
  accessToken: string;
}

export class LogoutResponseDto {
  success: boolean;
  message: string;
}
