import * as process from "process";

export function getEnvVariable(name: string) {
  const envElement = process.env[name];

  if (!envElement) {
    throw Error(`process.env.${name} is not defined`);
  }

  return envElement;
}

export function getStage(): Stage {
  return getEnvVariable("STAGE") as Stage;
}

function getRegion(): string {
  return getEnvVariable("AWS_REGION") as string;
}

function getCognitoUserPoolId(): string {
  return getEnvVariable("USER_POOL_ID") as string;
}

function getBaseUrl(): string {
  return getEnvVariable("BASE_URL");
}

function getButtonIssuesOpenSearchIndexName(): string {
  return getEnvVariable("OPENSEARCH_BUTTON_ISSUES_INDEX");
}

function getTicketEventsSNSArn(): string {
  return getEnvVariable("TICKET_EVENTS_SNS_TOPIC_ARN");
}

function getDomainEventsSNSArn(): string {
  return getEnvVariable("DOMAIN_EVENTS_SNS_TOPIC_ARN");
}

function getSuperAdminApiKey(): string {
  return getEnvVariable("SUPER_ADMIN_API_KEY");
}

export const env = {
  getStage,
  getRegion,
  getCognitoUserPoolId,
  getBaseUrl,
  getButtonIssuesOpenSearchIndexName,
  getTicketEventsSNSArn,
  getDomainEventsSNSArn,
  getSuperAdminApiKey,
};

enum Stage {
  dev = "dev",
  dev2 = "dev2",
  demo = "demo",
  qa = "qa",
  live = "live",
  test = "test",
}
