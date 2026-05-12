// Mirrors `eslint-flat-config-utils`' FlatConfigComposer surface enough to
// exercise the inspector's Promise-resolving loader: extends `Promise`,
// carries an own `_operations` field that would trip ConfigArray's schema
// validation if left unresolved, and resolves to the actual config array.
class MiniComposer extends Promise {
  _operations = []

  constructor() {
    super(() => {})
  }

  then(onFulfilled, onRejected) {
    return Promise.resolve([
      {
        name: 'composer/all',
        files: ['**/*.js'],
        rules: { 'no-console': 'warn' },
      },
    ]).then(onFulfilled, onRejected)
  }
}

export default new MiniComposer()
