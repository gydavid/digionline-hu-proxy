export type Category = {
  id: string;
  name: string;
};

export type Channel = {
  name: string;
  logoUrl: string;
  logo?: string;
  id: string;
  category: Category;
  url: string;
  programUrl: string;
};

export type Program = {
  startDate: Date;
  endDate: Date;
  id: string;
  title: string;
  subtitle: string;
  desc: string;
};

export type ParsedChannel = Channel & {
  programs: Program[];
};
