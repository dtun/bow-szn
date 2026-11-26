let items = new Map<string, string>();

let Storage = {
  getItemSync(key: string): string | null {
    return items.get(key) ?? null;
  },
  setItemSync(key: string, value: string): void {
    items.set(key, value);
  },
  removeItemSync(key: string): boolean {
    return items.delete(key);
  },
  clearSync(): boolean {
    items.clear();
    return true;
  },
};

export default Storage;
