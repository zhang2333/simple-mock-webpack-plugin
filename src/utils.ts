export const wait = (t: number): Promise<void> => new Promise(res => setTimeout(res, t))
