export class MemoryStore {
  items: any = {}
  async update (key: string, value: any): Promise<void> {
    this.items[key] = Object.assign({}, this.items[key], value)
  }

  async getItem (key: string): Promise<any> {
    return this.items[key]
  }

  async deleteItem (key: string): Promise<void> {
    delete this.items[key]
  }
}
