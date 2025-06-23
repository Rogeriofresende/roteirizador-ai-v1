"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroSection = HeroSection;
var Button_1 = require("../ui/Button");
var Badge_1 = require("../ui/Badge");
var lucide_react_1 = require("lucide-react");
var Mockup_1 = require("../ui/Mockup");
var Glow_1 = require("../ui/Glow");
var utils_1 = require("../../lib/utils");
function HeroSection(_a) {
    var badge = _a.badge, title = _a.title, description = _a.description, actions = _a.actions, imageSrc = _a.imageSrc, imageAlt = _a.imageAlt;
    return (<section className={(0, utils_1.cn)("bg-background text-foreground", "py-12 sm:py-24 md:py-32 px-4", "fade-bottom overflow-hidden pb-0")}>
      <div className="mx-auto flex max-w-container flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {/* Badge */}
          {badge && (<Badge_1.Badge variant="outline" className="animate-appear gap-2">
              <span className="text-muted-foreground">{badge.text}</span>
              <a href={badge.action.href} className="flex items-center gap-1">
                {badge.action.text}
                <lucide_react_1.ArrowRightIcon className="h-3 w-3"/>
              </a>
            </Badge_1.Badge>)}

          {/* Title */}
          <h1 className="relative z-10 inline-block animate-appear bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-md relative z-10 max-w-[550px] animate-appear font-medium text-muted-foreground opacity-0 delay-100 sm:text-xl">
            {description}
          </p>

          {/* Actions */}
          <div className="relative z-10 flex animate-appear justify-center gap-4 opacity-0 delay-300">
            <div className="relative z-10 flex animate-appear justify-center gap-4 opacity-0 delay-300">
              {actions.map(function (action, index) { return (<Button_1.Button key={index} variant={action.variant} size="lg" asChild>
                  <a href={action.href} className="flex items-center gap-2">
                    {action.icon}
                    {action.text}
                  </a>
                </Button_1.Button>); })}
            </div>
          </div>

          {/* Image with Glow */}
          <div className="relative pt-12">
            <Mockup_1.MockupFrame className="animate-appear opacity-0 delay-700" size="small">
              <Mockup_1.Mockup type="responsive">
                <img src={imageSrc} alt={imageAlt} width={1248} height={765}/>
              </Mockup_1.Mockup>
            </Mockup_1.MockupFrame>
            <Glow_1.Glow variant="top" className="animate-appear-zoom opacity-0 delay-1000"/>
          </div>
        </div>
      </div>
    </section>);
}
