export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
export class AuthMessageDto {
  message: string;
}
