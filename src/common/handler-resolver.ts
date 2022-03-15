export const handlerPath = (context: string) => {
    return `${context.split(process.cwd())[1].slice(1).replace(/\\/g, '/')}`;
};
