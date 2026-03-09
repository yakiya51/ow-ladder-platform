import { Transaction, db } from "./db";

type ServiceContext = {
  user: { id: string; battleTag: string };
  db: typeof db | Transaction;
};

export abstract class Service {
  constructor(
    protected user: ServiceContext["user"],
    protected db: ServiceContext["db"],
  ) {}
}

type ServiceClass<T extends Service> = new (ctx: ServiceContext) => T;

export async function invoke<T extends Service, Output>(
  Service: ServiceClass<T>,
  serviceMethod: (service: T) => Promise<Output>,
  ctx: ServiceContext,
): Promise<Output> {
  if (!ctx.user) {
    throw new Error(
      "User not found in context. Authentication is required before invoking services.",
    );
  }

  const service = new Service(ctx);
  return await serviceMethod(service);
}

export async function invokeTransaction<T extends Service, Output>(
  Service: ServiceClass<T>,
  serviceMethod: (service: T) => Promise<Output>,
  ctx: ServiceContext,
): Promise<Output> {
  if (!ctx.user) {
    throw new Error(
      "User not found in context. Authentication is required before invoking services.",
    );
  }

  return await db.transaction(async (tx) => {
    const service = new Service(ctx);
    return await serviceMethod(service);
  });
}
