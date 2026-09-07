
    

function PageIntro({ eyebrow, title, description, actions }) {
  return (
    <div className="page-intro">
      <div>
        <p className="eyebrow">
          <i /> {eyebrow}
        </p>
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="intro-actions">{actions}</div>}
    </div>
  );
}

export default PageIntro;