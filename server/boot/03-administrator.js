'use strict'

const { log } = console


module.exports = async function (app, next) {
  log('________________________________')
  log('ensuring administrator exists')

  const { User, Role, RoleMapping } = app.models

  const username = process.env.LB_ADMIN_USERNAME || 'admin'
  const email = process.env.LB_ADMIN_EMAIL || 'admin@email.net'
  const password = process.env.LB_ADMIN_PASSWORD || 'nimda'

  try {
    const admin = await User.findOne({ where: {username} })
    if (admin === null) {
      const user = await User.create({ username, email, password })
      const role = await Role.create({ name: 'admin' })
      await role.principals.create({
        principalType: RoleMapping.USER,
        principalId: user.id,
      })
      log('created a new admin user')
    } else {
      log('skipping admin creation')
    }
    next()
  } catch (err) {
    next(err)
  }
}
