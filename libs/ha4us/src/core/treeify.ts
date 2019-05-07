import { stringify } from 'querystring';
import { mergeAll } from 'rxjs/operators';

export interface TreeNode<T> {
  virtual: boolean;
  children: string[];
  level: number;
  parent: string;
  path: string[];
  data: T;
}

export function treeify<T>(
  objects: T[],
  getTopic: (T) => string = data => data
): TreeNode<T>[] {
  const map = new Map<string, TreeNode<T>>();
  const nodes: TreeNode<T>[] = [];

  // first step convert all real nodes
  objects.forEach(obj => {
    const topic = getTopic(obj);
    const path = topic.split('/');
    const parent = path.slice(0, path.length - 1).join('/');
    const node: TreeNode<T> = {
      virtual: false,
      children: [],
      path,
      level: path.length,
      parent: parent !== '' ? parent : undefined,
      data: obj,
    };
    map.set(topic, node);
  });

  // now process children and insert if necessary virtual parents
  map.forEach(node => {
    if (node.parent) {
      let parent = map.get(node.parent);
      if (!parent) {
        const path = node.path.slice(0, node.level - 1);
        const parentNode = node.path.slice(0, node.level - 2).join('/');
        parent = {
          virtual: true,
          children: [],
          path,
          level: node.level - 1,
          parent: parentNode !== '' ? parentNode : undefined,
          data: undefined,
        };
        map.set(node.parent, parent);
      }
      parent.children.push(node.path.join('/'));
    }
  });
  return Array.from(map.values());
}
