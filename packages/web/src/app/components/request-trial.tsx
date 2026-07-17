import { t } from 'i18next';

import { AnimatedIconButton } from '@/components/custom/animated-icon-button';
import { SendIcon } from '@/components/icons/send';
import { userHooks } from '@/hooks/user-hooks';

export type FeatureKey =
  | 'PROJECTS'
  | 'BRANDING'
  | 'PIECES'
  | 'TEMPLATES'
  | 'TEAM'
  | 'GLOBAL_CONNECTIONS'
  | 'USERS'
  | 'EVENT_DESTINATIONS'
  | 'API'
  | 'SSO'
  | 'AUDIT_LOGS'
  | 'ENVIRONMENT'
  | 'ISSUES'
  | 'ANALYTICS'
  | 'ALERTS'
  | 'ENTERPRISE_PIECES'
  | 'UNIVERSAL_AI'
  | 'SIGNING_KEYS'
  | 'CUSTOM_ROLES'
  | 'AGENTS'
  | 'TABLES'
  | 'TODOS'
  | 'BILLING'
  | 'MCPS'
  | 'SECRET_MANAGERS'
  | 'DEDICATED_WORKERS';

type RequestTrialProps = {
  featureKey: FeatureKey;
  customButton?: React.ReactNode;
  buttonVariant?: 'default' | 'basic';
  buttonSize?: 'default' | 'sm' | 'xs';
};

export const RequestTrial = ({
  featureKey,
  buttonVariant = 'default',
  buttonSize = 'default',
}: RequestTrialProps) => {
  const { data: currentUser } = userHooks.useCurrentUser();

  const handleClick = () => {
    const subject = encodeURIComponent(`FlowLogic feature request: ${featureKey}`);
    const body = encodeURIComponent(
      [
        `Hi FlowLogic team,`,
        ``,
        `I'd like to learn more about unlocking "${featureKey}" on my engine.`,
        ``,
        `${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}`.trim(),
        currentUser?.email ?? '',
      ].join('\n'),
    );
    window.location.href = `mailto:support@learnflowlogic.com?subject=${subject}&body=${body}`;
  };

  return (
    <AnimatedIconButton
      variant={buttonVariant}
      size={buttonSize}
      onClick={handleClick}
      icon={SendIcon}
      iconSize={14}
    >
      {t('Contact Sales')}
    </AnimatedIconButton>
  );
};
