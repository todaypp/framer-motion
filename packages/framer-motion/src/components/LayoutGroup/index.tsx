import * as React from "react"
import { MutableRefObject, useContext, useMemo, useRef } from "react"
import {
    LayoutGroupContext,
    LayoutGroupContextProps,
} from "../../context/LayoutGroupContext"
import { DeprecatedLayoutGroupContext } from "../../context/DeprecatedLayoutGroupContext"
import { nodeGroup } from "../../projection"
import { useForceUpdate } from "../../utils/use-force-update"

type InheritOption = boolean | "id"

export interface Props {
    id?: string
    inherit?: InheritOption

    /**
     * @deprecated
     */
    inheritId?: boolean
}

const shouldInheritGroup = (inherit: InheritOption) => inherit === true
const shouldInheritId = (inherit: InheritOption) =>
    shouldInheritGroup(inherit === true) || inherit === "id"

export const LayoutGroup: React.FunctionComponent<Props> = ({
    children,
    id,
    inheritId,
    inherit = true,
}) => {
    // Maintain backwards-compatibility with inheritId until 7.0
    if (inheritId !== undefined) inherit = inheritId

    const layoutGroupContext = useContext(LayoutGroupContext)
    const deprecatedLayoutGroupContext = useContext(
        DeprecatedLayoutGroupContext
    )
    const [forceRender, key] = useForceUpdate()
    const context = useRef(
        null
    ) as MutableRefObject<LayoutGroupContextProps | null>

    const upstreamId = layoutGroupContext.id ?? deprecatedLayoutGroupContext
    if (context.current === null) {
        if (shouldInheritId(inherit) && upstreamId) {
            id = id ? upstreamId + "-" + id : upstreamId
        }

        context.current = {
            id,
            group: shouldInheritGroup(inherit)
                ? layoutGroupContext?.group ?? nodeGroup()
                : nodeGroup(),
        }
    }

    const memoizedContext = useMemo(
        () => ({ ...context.current, forceRender }),
        [key]
    )

    return (
        <LayoutGroupContext.Provider value={memoizedContext}>
            {children}
        </LayoutGroupContext.Provider>
    )
}
