import { parseValue } from '../../render/syntax'
import Context from '../../context/context'
import { isArray } from '../../util/underscore'
import { FilterImplOptions } from './filter-impl-options'

type KeyValuePair = [string?, string?]
type FilterArg = string|KeyValuePair
export type FilterArgs = FilterArg[]

export class Filter {
  private name: string
  private impl: FilterImplOptions
  private args: FilterArgs
  private static impls: {[key: string]: FilterImplOptions} = {}

  public constructor (name: string, args: FilterArgs, strictFilters: boolean) {
    const impl = Filter.impls[name]
    if (!impl && strictFilters) throw new TypeError(`undefined filter: ${name}`)

    this.name = name
    this.impl = impl || (x => x)
    this.args = args
  }
  public async render (value: any, context: Context) {
    const argv: any[] = []
    for (const arg of this.args) {
      if (isKeyValuePair(arg)) argv.push([arg[0], await parseValue(arg[1], context)])
      else argv.push(await parseValue(arg, context))
    }
    return this.impl.apply({ context }, [value, ...argv])
  }
  public static register (name: string, filter: FilterImplOptions) {
    Filter.impls[name] = filter
  }
  public static clear () {
    Filter.impls = {}
  }
}

function isKeyValuePair (arr: FilterArg): arr is KeyValuePair {
  return isArray(arr)
}
