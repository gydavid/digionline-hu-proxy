export type Channel = {
  url: string;
  name: string;
  slug: string;
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
