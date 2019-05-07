import { Ha4usObject, IPager } from '.'

export interface Ha4usObjectSearch {
  pattern?: string
  tags?: string[]
  name?: string
  role?: string
}

export type Ha4usObjectQuery = string | Ha4usObjectSearch

export abstract class AbstractObjectService {
  public abstract getOne<T extends Ha4usObject>(topic: string): Promise<T>
  /**
   * get
   * @param  {Ha4usObjectQuery} topic [description]
   * @return {Ha4usObject[]}          [description]
   */
  public abstract get(query: Ha4usObjectQuery): Promise<Ha4usObject[]>
  public abstract get(
    query: Ha4usObjectQuery,
    page: number,
    pagesize?: number
  ): Promise<IPager<Ha4usObject>>
  public abstract get(
    query: Ha4usObjectQuery,
    page?: number,
    pagesize?: number
  ): Promise<IPager<Ha4usObject> | Ha4usObject[]>

  public abstract put<T extends Ha4usObject>(obj: T, topic?: string): Promise<T>

  public abstract post<T extends Ha4usObject>(
    obj: Partial<Ha4usObject>
  ): Promise<T>

  public abstract delete<T extends Ha4usObject>(topic: string): Promise<T>

  public abstract allTags(pattern: string)

  public abstract autocomplete(topic: string): Promise<string[]>

  public abstract new<T extends Ha4usObject>(
    topic: string,
    data?: Partial<Ha4usObject>
  ): T
}
