import PageTitle from './PageTitle.jsx';
import SampleHint from './SampleHint.jsx';

export default function FeaturePlaceholder({ title }) {
  return (
    <>
      <PageTitle eyebrow={`PLATFORM / ${title.toUpperCase()}`} title={title} description={`Review ${title.toLowerCase()} across your platform.`} />
      <SampleHint />
      <section className="panel"><h2>{title} view</h2><p className="aside-copy">This section is part of the EDOP navigation design. Its live data and workflows will be added in a later implementation phase.</p></section>
    </>
  );
}
