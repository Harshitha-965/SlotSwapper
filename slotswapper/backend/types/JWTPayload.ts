export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  college: string;
  role: "Admin" | "Faculty";
  iat?: number;
  exp?: number;
}