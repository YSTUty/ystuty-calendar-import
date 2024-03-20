export const apiPath = process.env.REACT_APP_API_URL || `//${window.location.host}/api`;
export const icalUrl = process.env.REACT_APP_ICAL_URL!;
export const appHost = process.env.REACT_APP_MAIN_HOST!;

export const linkYSTUty = process.env.REACT_APP_LINK_YSTUTY;
export const linkToGitHub = process.env.REACT_APP_LINK_2GH;
export const linkToVK = process.env.REACT_APP_LINK_2VK;
export const linkToScheduleViewer = process.env.REACT_APP_LINK_2VIEWER;
export const linkToSupport = process.env.REACT_APP_LINK_SUPPORT;

export const telegramUsername = process.env.REACT_APP_TELEGRAM_USERNAME;

export const vkWidgetsApiId =
    process.env.REACT_APP_VK_WIDGETS_API_ID && !isNaN(+process.env.REACT_APP_VK_WIDGETS_API_ID)
        ? +process.env.REACT_APP_VK_WIDGETS_API_ID
        : undefined;
