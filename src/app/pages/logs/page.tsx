import { LazyLog } from '@melloware/react-logviewer';

const Page = () => {
  return (
    <div>
      <h1>Page</h1>
      <LazyLog url="http://example.log" />
    </div>
  );
};

export default Page;
