import { DIContainer } from './di'

import { Ha4usOptions } from '../adapter'

export async function createHa4usContainer(
  options: Ha4usOptions
): Promise<DIContainer> {
  const c = DIContainer.getContainer()

  if (!options.imports) {
    options.imports = [
      '$args',
      '$log',
      // '$maps',
      '$media',
      '$yaml',
      '$states',
      '$objects',
      '$users',
      '$injector',
      // '$config',
    ]
  }
  c.registerValue('$options', options)

  await options.imports.forEach(async (dep: string) => {
    switch (dep) {
      case '$injector':
        c.registerValue(dep, c)
        break
      case '$log':
        c.registerFactory(dep, require('../log.factory').LogFactory)
        break

      case '$args':
        c.registerFactory(dep, require('../argument.factory').ArgumentFactory)

        break
      /* case '$maps':
        c.registerService(dep, require('./map.service').MapService)
        break
      case '$config':
        c.registerService(dep, require('./config.service').ConfigService)
        break*/
      case '$yaml':
        c.registerService(dep, require('../yaml.service').YamlService)
        break
      case '$states':
        c.registerService(dep, require('../state.service').StateService)
        break
      case '$objects':
        c.registerService(dep, require('../object.service').ObjectService)

        break
      case '$os':
        c.registerService(
          dep,
          require('../stateful-objects.service').StatefulObjectsService
        )
        break
      case '$media':
        c.registerService(dep, require('../db-media.service').DBMediaService)
        break
      case '$users':
        c.registerService(dep, require('../user.service').UserService)
        break
      case '$options':
        // default - already added by default
        break
      default:
        throw new Error(`module '${dep}' does not exist`)
      // do nothing;
    }
  })

  return c
}
export function destroyContainer() {
  const c = DIContainer.getContainer()
  c.destroy()
}
