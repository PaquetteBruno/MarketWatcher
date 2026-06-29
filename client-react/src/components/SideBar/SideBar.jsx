function SideBar({ smallIcon, title }) {
  return (
    <div>
      <h1
        style={{
          color: "#ffffff",
          margin: "0 0 5px 0",
          fontSize: "24px",
        }}
      >
        {smallIcon} {title}
      </h1>
    </div>
  );
}
export default SideBar;
