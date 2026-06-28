export default function Spinner({ size = "md", className = "" }) {
    const sizes = {
        sm: "h-5 w-5",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    };
    return (
        <div className={"flex items-center justify-center " + className}>
            <div
                className={
                    "animate-spin rounded-full border-b-2 border-forest-500 " +
                    (sizes[size] || sizes.md)
                }
            />
        </div>
    );
}
