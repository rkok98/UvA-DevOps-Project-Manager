export const getEnv = (name: string): string => {
  const env = process.env.CDK_ENVIRONMENT;

  return env ? `${env}-${name}` : name;
};

export default { getEnv };
