// 简单的品牌类型：让 string ID 在 TS 里保持区分（不引入运行时开销）
export type Brand<T, B extends string> = T & { readonly __brand: B }

export type Id<B extends string> = Brand<string, B>
