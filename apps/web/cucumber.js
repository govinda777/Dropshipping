module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['e2e/step-definitions/**/*.ts', 'e2e/support/**/*.ts'],
    paths: ['e2e/features/**/*.feature'],
    format: ['html:e2e-report.html', 'summary'],
    publishQuiet: true
  }
};
