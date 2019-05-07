import { Subject } from 'rxjs'

export interface TopicTreeNode<T> {
  virtual: boolean
  children: TopicTreeNode<T>[]
  level: number
  parent: string
  path: string[]
  name: string
  data: T
}

export interface TopicTreeChanged<T> {
  source: TopicTreeDataBase<T>
}

export type NodeMap<T> = Map<string, TopicTreeNode<T>>

export class TopicTreeDataBase<T> {
  protected _nodeMap: NodeMap<T>

  /** Event emitted when the value has changed. */
  changed: Subject<TopicTreeChanged<T>> = new Subject()

  set data(value: T[]) {
    this._nodeMap = this.treeify(value)
    this.changed.next({
      source: this,
    })
  }

  get root(): TopicTreeNode<T>[] {
    return Array.from(this._nodeMap.values()).filter(node => node.level === 0)
  }

  constructor(
    protected getTopic: (T) => string = data => data,
    initialData: T[] = []
  ) {
    this._nodeMap = this.treeify(initialData)
  }

  has(topic: string) {
    return this._nodeMap.has(topic)
  }

  get(topic: string) {
    return this._nodeMap.get(topic)
  }

  protected treeify(
    objects: T[],
    getTopic: (T) => string = data => data
  ): NodeMap<T> {
    const nodeMap: NodeMap<T> = new Map<string, TopicTreeNode<T>>()

    // first step convert all real nodes
    objects.forEach(obj => {
      const topic = this.getTopic(obj)
      const path = topic.split('/')
      const parent = path.slice(0, path.length - 1).join('/')
      const node: TopicTreeNode<T> = {
        name: path[path.length - 1],
        virtual: false,
        children: [],
        path,
        level: path.length - 1,
        parent: parent !== '' ? parent : undefined,
        data: obj,
      }
      nodeMap.set(topic, node)
    })

    // now process children and insert if necessary virtual parents
    nodeMap.forEach(node => {
      if (node.parent) {
        let parent = nodeMap.get(node.parent)
        if (!parent) {
          const path = node.path.slice(0, node.level)
          const parentNode = node.path.slice(0, node.level - 1).join('/')
          parent = {
            name: path[node.level - 1],
            virtual: true,
            children: [],
            path,
            level: node.level - 1,
            parent: parentNode !== '' ? parentNode : undefined,
            data: undefined,
          }
          nodeMap.set(node.parent, parent)
        }
        parent.children.push(node)
      }
    })
    return nodeMap
  }
}
