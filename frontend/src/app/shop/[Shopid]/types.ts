export type CallRule = {
  id: number;
  shopId: string; 
  category: string;
  option: string;
  callText: string;
  optionOrder?: number;
};

export type Shop = {
  id: string;
  name: string;
  callticketOrder: string;
  callOrder: string;
  callRules: CallRule[];
};