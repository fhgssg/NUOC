export const formatedCurrentDate = () => {
  const date = new Date().getDate();
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  return `${year}-${month > 9 ? month : `0${month}`}-${
    date > 9 ? date : `0${date}`
  }`;
};
