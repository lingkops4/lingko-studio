
export type LogoStyle = 'minimalist' | 'cyberpunk' | 'corporate' | 'abstract' | '3d' | 'line-art' | 'gradient';

export interface LogoGenerationParams {
  prompt: string;
  style: LogoStyle;
  colorPalette: string;
  isHighQuality: boolean;
}

export interface GeneratedLogo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  params: LogoGenerationParams;
}

export interface EditRequest {
  baseImage: string;
  instruction: string;
}
