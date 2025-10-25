export interface PresetConfig {
  name: string;
  description: string;
  files: TemplateFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export interface TemplateFile {
  path: string;
  content: string;
  template?: boolean;
}
