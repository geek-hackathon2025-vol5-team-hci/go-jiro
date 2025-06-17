export type CallRule = {
  id: number;
  shopId: number;
  category: string;
  option: string;
  callText: string;
};

export type Shop = {
  id: number;
  name: string;
  callticketOrder: string;
  callOrder: string;
  callRules: CallRule[];
};