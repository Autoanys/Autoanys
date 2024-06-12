import { get } from "http";

const variableConfigInit = {
  today: getToday(),
  yesterday: getYesterday(),
  thisWeek: getThisWeek(),
  thisMonth: getThisMonth(),
  thisYear: getThisYear(),
  lastWeek: getLastWeek(),
  lastMonth: getLastMonth(),
  lastYear: getLastYear(),
  nextWeek: getNextWeek(),
  nextMonth: getNextMonth(),
  nextYear: getNextYear(),
  timeNow: getTimeNow(),
};

function getTimeNow() {
  let date = new Date();
  let time = date.toTimeString().split(" ")[0];
  return time;
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getYesterday() {
  let date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

function getThisWeek() {
  let date = new Date();
  let day = date.getDay();
  let diff = date.getDate() - day + (day == 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split("T")[0];
}

function getThisMonth() {
  let date = new Date();
  return date.toISOString().split("T")[0].substring(0, 7);
}

function getThisYear() {
  let date = new Date();
  return date.toISOString().split("T")[0].substring(0, 4);
}

function getLastWeek() {
  let date = new Date();
  let day = date.getDay();
  let diff = date.getDate() - day - 6;
  date.setDate(diff);
  return date.toISOString().split("T")[0];
}

function getLastMonth() {
  let date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().split("T")[0].substring(0, 7);
}

function getLastYear() {
  let date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().split("T")[0].substring(0, 4);
}

function getNextWeek() {
  let date = new Date();
  let day = date.getDay();
  let diff = date.getDate() - day + 7;
  date.setDate(diff);
  return date.toISOString().split("T")[0];
}

function getNextMonth() {
  let date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split("T")[0].substring(0, 7);
}

function getNextYear() {
  let date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split("T")[0].substring(0, 4);
}

export default variableConfigInit;
