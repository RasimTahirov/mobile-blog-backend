export const generateUrl = (name: string) => {
  const fileName = Date.now();
  const extension = name.split('.').pop();

  return `${fileName}.${extension}`;
};
