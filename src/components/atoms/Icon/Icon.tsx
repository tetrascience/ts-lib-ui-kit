import { ReactElement } from "react";
import Bars3BottomLeft from "@assets/icon/Bars3BottomLeft";
import Building from "@assets/icon/Building";
import BulkCheck from "@assets/icon/BulkCheck";
import Check from "@assets/icon/Check";
import CheckCircle from "@assets/icon/CheckCircle";
import CheckSquare from "@assets/icon/CheckSquare";
import ChevronDown from "@assets/icon/ChevronDown";
import Close from "@assets/icon/Close";
import Code from "@assets/icon/Code";
import Computer from "@assets/icon/Computer";
import Copy from "@assets/icon/Copy";
import Cube from "@assets/icon/Cube";
import Database from "@assets/icon/Database";
import ExclamationCircle from "@assets/icon/ExclamationCircle";
import ExclamationTriangle from "@assets/icon/ExclamationTriangle";
import Gear from "@assets/icon/Gear";
import Globe from "@assets/icon/Globe";
import Hashtag from "@assets/icon/Hashtag";
import Home from "@assets/icon/Home";
import Inbox from "@assets/icon/Inbox";
import InformationCircle from "@assets/icon/InformationCircle";
import InformationCircleMicro from "@assets/icon/InformationCircleMicro";
import Lamp from "@assets/icon/Lamp";
import LockOpen from "@assets/icon/LockOpen";
import Minus from "@assets/icon/Minus";
import PaperPlaneIcon from "@assets/icon/PaperPlane";
import Pencil from "@assets/icon/Pencil";
import PieChart from "@assets/icon/PieChart";
import Pipeline from "@assets/icon/Pipeline";
import Plus from "@assets/icon/Plus";
import Profile from "@assets/icon/Profile";
import QuestionCircle from "@assets/icon/QuestionCircle";
import RocketLaunch from "@assets/icon/RocketLaunch";
import Search from "@assets/icon/Search";
import SearchDocument from "@assets/icon/SearchDocument";
import SearchSQL from "@assets/icon/SearchSQL";
import Sitemap from "@assets/icon/Sitemap";
import TetraScienceIcon from "@assets/icon/TetraScienceIcon";
import Text from "@assets/icon/Text";
import Trash from "@assets/icon/Trash";
import ViewfinderCircle from "@assets/icon/ViewfinderCircle";

interface IconsProps {
  fill?: string;
  width?: string;
  height?: string;
  name: IconName;
}

interface IconProps {
  fill?: string;
  width?: string;
  height?: string;
}

enum IconName {
  BARS_3_BOTTOM_LEFT = "bars-3-bottom-left",
  BUILDING = "building",
  BULK_CHECK = "bulk-check",
  CHECK = "check",
  CHECK_CIRCLE = "check-circle",
  CHECK_SQUARE = "check-square",
  CHEVRON_DOWN = "chevron-down",
  CLOSE = "close",
  CODE = "code",
  COMPUTER = "computer",
  COPY = "copy",
  CUBE = "cube",
  DATABASE = "database",
  EXCLAMATION_CIRCLE = "exclamation-circle",
  EXCLAMATION_TRIANGLE = "exclamation-triangle",
  GEAR = "gear",
  GLobe = "globe",
  HASHTAG = "hashtag",
  HOME = "home",
  INBOX = "inbox",
  INFORMATION_CIRCLE = "information-circle",
  INFORMATION_CIRCLE_MICRO = "information-circle-micro",
  LAMP = "lamp",
  LOCK_OPEN = "lock-open",
  MINUS = "minus",
  PAPER_PLANE = "paper-plane",
  PENCIL = "pencil",
  PIE_CHART = "pie-chart",
  PIPELINE = "pipeline",
  PLUS = "plus",
  PROFILE = "profile",
  QUESTION_CIRCLE = "question-circle",
  ROCKET_LAUNCH = "rocket-launch",
  SEARCH = "search",
  SEARCH_DOCUMENT = "search-document",
  SEARCH_SQL = "search-sql",
  SITEMAP = "sitemap",
  TETRASCIENCE_ICON = "tetrascience-icon",
  TEXT = "text",
  TRASH = "trash",
  VIEWFINDER_CIRCLE = "viewfinder-circle",
}

const Icon = (props: IconsProps) => {
  let svg: ReactElement | null = null;
  const { name } = props;

  switch (name) {
    case IconName.BARS_3_BOTTOM_LEFT:
      svg = <Bars3BottomLeft {...props} />;
      break;
    case IconName.BUILDING:
      svg = <Building {...props} />;
      break;
    case IconName.BULK_CHECK:
      svg = <BulkCheck {...props} />;
      break;
    case IconName.CHECK:
      svg = <Check {...props} />;
      break;
    case IconName.CHECK_CIRCLE:
      svg = <CheckCircle {...props} />;
      break;
    case IconName.CHECK_SQUARE:
      svg = <CheckSquare {...props} />;
      break;
    case IconName.CHEVRON_DOWN:
      svg = <ChevronDown {...props} />;
      break;
    case IconName.CLOSE:
      svg = <Close {...props} />;
      break;
    case IconName.CODE:
      svg = <Code {...props} />;
      break;
    case IconName.COMPUTER:
      svg = <Computer {...props} />;
      break;
    case IconName.COPY:
      svg = <Copy {...props} />;
      break;
    case IconName.CUBE:
      svg = <Cube {...props} />;
      break;
    case IconName.DATABASE:
      svg = <Database {...props} />;
      break;
    case IconName.EXCLAMATION_CIRCLE:
      svg = <ExclamationCircle {...props} />;
      break;
    case IconName.EXCLAMATION_TRIANGLE:
      svg = <ExclamationTriangle {...props} />;
      break;
    case IconName.GEAR:
      svg = <Gear {...props} />;
      break;
    case IconName.GLobe:
      svg = <Globe {...props} />;
      break;
    case IconName.HASHTAG:
      svg = <Hashtag {...props} />;
      break;
    case IconName.HOME:
      svg = <Home {...props} />;
      break;
    case IconName.INBOX:
      svg = <Inbox {...props} />;
      break;
    case IconName.INFORMATION_CIRCLE:
      svg = <InformationCircle {...props} />;
      break;
    case IconName.INFORMATION_CIRCLE_MICRO:
      svg = <InformationCircleMicro {...props} />;
      break;
    case IconName.LAMP:
      svg = <Lamp {...props} />;
      break;
    case IconName.LOCK_OPEN:
      svg = <LockOpen {...props} />;
      break;
    case IconName.MINUS:
      svg = <Minus {...props} />;
      break;
    case IconName.PAPER_PLANE:
      svg = <PaperPlaneIcon {...props} />;
      break;
    case IconName.PENCIL:
      svg = <Pencil {...props} />;
      break;
    case IconName.PIE_CHART:
      svg = <PieChart {...props} />;
      break;
    case IconName.PIPELINE:
      svg = <Pipeline {...props} />;
      break;
    case IconName.PLUS:
      svg = <Plus {...props} />;
      break;
    case IconName.PROFILE:
      svg = <Profile {...props} />;
      break;
    case IconName.QUESTION_CIRCLE:
      svg = <QuestionCircle {...props} />;
      break;
    case IconName.ROCKET_LAUNCH:
      svg = <RocketLaunch {...props} />;
      break;
    case IconName.SEARCH:
      svg = <Search {...props} />;
      break;
    case IconName.SEARCH_DOCUMENT:
      svg = <SearchDocument {...props} />;
      break;
    case IconName.SEARCH_SQL:
      svg = <SearchSQL {...props} />;
      break;
    case IconName.SITEMAP:
      svg = <Sitemap {...props} />;
      break;
    case IconName.TETRASCIENCE_ICON:
      svg = <TetraScienceIcon {...props} />;
      break;
    case IconName.TEXT:
      svg = <Text {...props} />;
      break;
    case IconName.TRASH:
      svg = <Trash {...props} />;
      break;
    case IconName.VIEWFINDER_CIRCLE:
      svg = <ViewfinderCircle {...props} />;
      break;

    default:
      throw `[Icon] name "${name}" does not exist`;
  }
  return <div style={{ display: "inline-flex" }}>{svg}</div>;
};

export { Icon, IconName };
export type { IconProps, IconsProps };
