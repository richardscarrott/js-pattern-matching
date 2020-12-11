export type Predicate<PV> = (value: PV) => boolean;

/**
 * Predicate check if `CV` value === `PV` value
 *
 * @param value
 */
export function strictEqual<CV, PV>(value: CV): Predicate<PV>;

/**
 * Predicate check if `CV` value == `PV` value
 *
 * @param value
 */
export function shallowEqual<CV, PV>(value: CV): Predicate<PV>;

/**
 * Predicate check if `PV` value have **all** keys
 */
export function haveKeys<PV>(...keys: string[]): Predicate<PV>;

/**
 * Predicate check if `PV` value have `CV` key value with `===`
 */
export function objectStrictLike<CV, PV>(value: CV): Predicate<PV>;

/**
 * Predicate check if `PV` value have `CV` key value with `==`
 */
export function objectShallowLike<CV, PV>(value: CV): Predicate<PV>;

/**
 * Predicate check if `PV` value have `CV` key value with `===` in deep
 */
export function objectDeepStrictLike<CV, PV>(value: CV): Predicate<PV>;

/**
 * Predicate check if `PV` value have `CV` key value with `==` in deep
 */
export function objectDeepShallowLike<CV, PV>(value: CV): Predicate<PV>;

export type ExtractSchemaCallback = (value: ExtractSchema) => any;

export interface ExtractSchema {
  /**
   * With indexable key as `fromKey`, value associated as `newKey`, instance of [[ExtractSchema]] as `value`
   *
   * - If `newKey` is `false`, skip
   * - If `newKey` is `ExtractSchemaCallback` map `[fromKey]=newKey(value)`
   * - If `newKey` is `string|symbol`  map `[fromKey]=value[newKey]`
   * - If `newKey` is `true` map `[fromKey]=value[fromKey]`
   */
  [key: string]: boolean | string | symbol | ExtractSchemaCallback;
}

export type Evaluator<PV, R> = (patternValue: PV) => R;

/**
 * create an extractor function.
 *
 * @see [[ExtractSchema]] for understand how extractor will map data
 *
 * @param schema - define mapping of object
 * @returns a function who generate an object populate with key from schema and value from obj
 *
 * @example
 *
 * ```js
 * import { extractValue } from '@tpoisseau/pattern-matching/evaluators';
 *
 * const mapper = extractValue({
 *  foo: true,
 *  bar: false, // for the demo but it's no use
 *  baz: value => value.toto,
 *  tata: 'foo',
 * });
 *
 * > mapper({foo: 42, bar: 'baz', baz: 'foo', toto: 'tata'})
 * > {
 *     foo: 42,
 *     baz: 'tata',
 *     tata: 42
 * }
 * ```
 */
export function extractValue<
  EV extends ExtractSchema,
  PV extends { [key: string]: any },
  R extends { [key: string]: any }
>(schema: EV): Evaluator<PV, R>;

/**
 * Create a function who will return value
 *
 * @param value
 *
 * @example
 *
 * ```js
 * import { returnValue } from '@tpoisseau/pattern-matching/evaluators';
 *
 * const getFoo = returnValue('foo');
 *
 * > getFoo()
 * > 'foo'
 * > getFoo('bar')
 * > 'foo'
 * ```
 */
export function returnValue<EV, PV, R extends EV>(value: EV): Evaluator<PV, R>;

/**
 * When evaluator is called, throw error
 *
 * @param error
 */
export function throwError<EV extends Error | string, PV, R>(
  error: EV
): Evaluator<PV, R>;

/**
 * When evaluator is called, throw new ErrorClass(PV)
 *
 * @param ErrorClass
 */
export function throwNewError<EV extends typeof Error, PV, R>(
  ErrorClass: EV
): Evaluator<PV, R>;

// import * as comparators from '@tpoisseau/pattern-matching/comparators';
// import * as evaluators from '@tpoisseau/pattern-matching/evaluators';

/**
 * You can use PatternMatching class as a evoluated Pattern Strategy
 *
 * Compile strategy you need, and execute the adapted startegy matched by executed value.
 *
 * @example
 *
 * ```js
 * import http from 'http';
 * import https from 'https';
 * import http2 from 'http2';
 *
 * import { PatternMatching } from '@tpoisseau/pattern-matching';
 * import { throwError } from '@tpoisseau/pattern-matching/evaluators';
 *
 * const serverStrategies = new PatternMatching()
 *  .match('http', http)
 *  .match('https', https)
 *  .match('http2', http2)
 *  .default(throwError('Unsupported protocol'))
 *
 * const createStrategies = new PatternMatching()
 *  .match(protocol => /^https?$/.test(protocol), 'createServer')
 *  .match('http2', 'createSecureServer')
 *  .default(throwError('Unsupported protocol'))
 *
 * serverStrategies.exec('http')[createStrategies.exec('http')]()
 * serverStrategies.exec('https')[createStrategies.exec('https')]()
 * serverStrategies.exec('http2')[createStrategies.exec('http2')]()
 * ```
 *
 * @see [[Predicate]]
 * @see [[Evaluator]]
 */
export class PatternMatching<EV, PV, R> {
  private _stack: Map<Predicate<PV>, Evaluator<PV, R>>;
  private _defaultEvaluator: Evaluator<PV, R>;

  /**
   * Add in [[stack]] an entry of <Predicate<PV>, Evaluator<PV, R>>
   *
   * @param comparator - if comparator is not a [[Predicate]], use [[objectStrictLike]] if typeof comparator is object else [[strictEqual]]
   * @param evaluator - if evaluator is not an [[Evaluator]], use [[returnValue]]
   */
  match(
    comparator: Predicate<PV> | object | any,
    evaluator: Evaluator<PV, R> | EV
  ): this;

  /**
   * set [[defaultEvaluator]] with evaluator param
   *
   * @param evaluator - if evaluator is not an [[Evaluator]], use [[returnValue]]
   */
  default(evaluator?: Evaluator<PV, R> | EV): this;

  /**
   * Iterate on stack entries
   * If value match predicate, return R value from Evaluator
   *
   * @param value
   */
  exec(value: PV): R;
}

/**
 * Proxy of [[PatternMatching]] generated by [[pattern]]
 */
export interface ProxyPatternMatching<EV, PV, R>
  extends PatternMatching<EV, PV, R> {
  /**
   * You can end chain call with `exec()` from `pattern(value)`
   *
   * will call [[PatternMatching.exec]] with value from pattern
   *
   * @override `exec(value: Va)`
   */
  exec(): R;

  /**
   * You also can chain call with `()` from `pattern(value)`
   *
   * will call [[PatternMatching.exec]] with value from pattern
   */
  (): R;
}

/**
 * Provide a pattern-matching like syntax with functional fluent chainable api
 *
 * Think `pattern` as `switch` keyword and `match` as `case` keyword but without need to `break` the `switch-case` expression
 *
 * - First `match` param should be a [[Predicate]], if not create a predicate with [[strictEqual]]
 * - Second `match` param should be an [[Evaluator]], if not create an Evaluator with [[returnValue]]
 *
 * You could set a a default evaluator (take pattern value as argument) return what you want
 *
 * If a [[ProxyPatternMatching]] or [[PatternMatching]] is executed with no matching value. It will return the pattern value by default.
 * Use `.default(evaluator)` for override
 *
 * @param value
 *
 * @example
 * ```js
 * import pattern from '@tpoisseau/pattern-matching';
 *
 * const value = pattern('foo')
 *  .match('bar', Symbol('bar'))
 *  .match('foo', Symbol('foo'))
 *  .exec(); // value Symbol('foo')
 * ```
 *
 * https://github.com/tc39/proposal-pattern-matching#motivating-examples
 *
 * ### Matching `fetch()` response
 *
 * ```js
 * import pattern from '@tpoisseau/pattern-matching'
 * import {objectStrictLike} from '@tpoisseau/pattern-matching/comparators'
 * import {throwNewError} from '@tpoisseau/pattern-matching/evaluators'
 *
 * pattern(await fetch(jsonService))
 *  .match(objectStrictLike({status: 200}), ({headers: {'Content-Length': l}}) => console.log(l))
 *  .match({status: 404}, () => console.log('JSON not found'))
 *  .match(({status}) => status >= 404, throwNewError(RequestError))
 *  .exec()
 * ```
 *
 * ### Handling Reducer
 *
 * ```js
 * import pattern from '@tpoisseau/pattern-matching'
 * import {objectStrictLike} from '@tpoisseau/pattern-matching/comparators'
 *
 * function todoApp(state=initialState, action) {
 *     return pattern(action)
 *      .match({type: 'set-visibility-filter'}, ({filter: visFilter}) => ({...state, visFilter}))
 *      .match(objectStrictLike({type: 'add-todo'}), ({text}) => ({...state, todos: [...state.todos, {text}]})
 *      .match({type: 'toggle-todo'}, ({index}) => ({
 *          ...state,
 *          todos: state.todos.map(({...item, done}, idx) => ({...item, done: idx === index ? !done : done})
 *      })
 *      .default(state)()
 * }
 * ```
 *
 * When firts param of match is an object use [[objectStrictLike]] to generate the predicate.
 *
 * ### mixed in with JSX code for quick props handling
 *
 * ```jsx
 * import pattern from '@tpoisseau/pattern-matching'
 * import { haveKeys } from '@tpoisseau/pattern-matching/comparators'
 *
 * <Fetch url={API_URL}>{
 *     props => pattern(props)
 *      .match(haveKeys('loading'), <Loading />)
 *      .match(haveKeys('error'), ({error}) => <Error error={error} />)
 *      .match(haveKeys('data'), ({data}) => <Page data={data} />)()
 * }</Fetch>
 * ```
 *
 * When the second parameter of match (evaluator) is not a function will use the [[returnValue]] factory evaluator
 * So `.match(haveKeys('loading'), <Loading />)` is like using `.match(haveKeys('loading'), () => <Loading />)`
 *
 * ### General structural duck-typing on an API for vector-likes.
 *
 * ```js
 * import pattern from '@tpoisseau/pattern-matching'
 * import { haveKeys } from '@tpoisseau/pattern-matching/comparators'
 *
 * const getLength = vector => pattern(vector)
 *  .match(haveKeys('x', 'y', 'z'), ({x, y, z}) => Math.sqrt(x**2 + y**2 + z**2))
 *  .match(haveKeys('x', 'y'), ({x, y}) => Math.sqrt(x**2 + y**2))
 *  .match(haveKeys('x'), ({x}) => Math.sqrt(x**2))
 *  .match(Array.isArray, vector => Math.sqrt.apply(Math, vector.map(v => v**2)))
 *  .default(NaN)()
 * ```
 */
export default function pattern<EV, PV, R>(
  value: PV
): ProxyPatternMatching<EV, PV, R>;
