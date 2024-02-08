import { Button, ButtonProps } from "antd";
import Link from "next/link"
import { ReactNode } from "react";

type LinkButtonProps = {
    href: string;
    children?: ReactNode
} & ButtonProps;

const LinkButton = ({href, children, ...buttonProps }: LinkButtonProps) => {
    return (
        <Link href={href} className="!border-0">
            <Button {...buttonProps}>{children}</Button>
        </Link>
    )
}

export default LinkButton