export class KV<V> {
  private store = new Map<string, V>();
  private expirations = new Map<string, number>();

  set(key: string, value: V, expiresInSeconds?: number) {
    if (expiresInSeconds !== undefined) {
      this.expirations.set(key, Date.now() + expiresInSeconds * 1000);
    }
    return this.store.set(key, value);
  }

  get(key: string) {
    const value = this.store.get(key);
    if (!value) return null;

    if (this.isExpired(key)) {
      this.delete(key);
      return null;
    }

    return value;
  }

  has(key: string) {
    if (this.isExpired(key)) {
      this.delete(key);
      return false;
    }

    return this.store.has(key);
  }

  delete(key: string) {
    this.expirations.delete(key);
    return this.store.delete(key);
  }

  values() {
    return this.store.values();
  }

  private isExpired(key: string) {
    const expiresAt = this.expirations.get(key);
    if (expiresAt === undefined) return false;

    return Date.now() > expiresAt;
  }
}
