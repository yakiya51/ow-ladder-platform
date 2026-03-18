import { Transaction, db } from "../db/connection";

export type ServiceContext = {
  db: typeof db | Transaction;
  user: {
    id: string;
    battleTag: string;
    mmr: number;
  };
};

export type ServiceProps<T = {}> = [{ ctx: ServiceContext }, T];

export async function tx<Output>(
  ctx: ServiceContext,
  run: (txCtx: ServiceContext) => Promise<Output>,
): Promise<Output> {
  return db.transaction(async (trx) => {
    const txCtx: ServiceContext = { ...ctx, db: trx };
    return await run(txCtx);
  });
}
