import * as os from 'os'
import * as util from 'util'

export function getIp(interfaces, family) {
  let retIp
  family = family || 'IPv4'
  interfaces = interfaces || 'en0,lo0'

  const ifaces = interfaces.split(',')

  const ifconf = os.networkInterfaces()

  for (const iface of ifaces) {
    if (ifconf.hasOwnProperty(iface)) {
      for (const singleIConf of ifconf[iface]) {
        if (singleIConf.family === family) {
          return singleIConf.address
        }
      }
    }
  }
  retIp = ifconf

  return retIp
}

export function getIPs(strInterfaces, family) {
  family = family || 'IPv4'

  const ifaces = strInterfaces.split(',')
  const ips = []

  const ifconf = os.networkInterfaces()

  ifaces.forEach((iface) => {
    if (ifconf.hasOwnProperty(iface)) {
      ifconf[iface]
        .filter(
          (ipInfo) => /*ipInfo.internal === false &&*/ ipInfo.family === 'IPv4',
        )
        .forEach((ipInfo) => ips.push(ipInfo.address))
    }
  })

  return ips
}

export function inspect(object) {
  return util.inspect(object, {
    colors: true,
    depth: null,
  })
}

export function validIp(ip): boolean {
  let retVal = typeof ip === 'string'
  if (retVal) {
    retVal = retVal && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)
  }
  return retVal
}
