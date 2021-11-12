"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmds = void 0;
exports.cmds = ["AA", "aa", "above", "abovewithdelims", "acute", "AE", "ae", "alef", "alefsym", "aleph", "allowbreak", "Alpha", "alpha", "amalg", "And", "and", "ang", "angl", "angle", "approx", "approxeq", "arccos", "arcctg", "arcsin", "arctan", "arctg", "arg", "argmax", "argmin", "array", "arraystretch", "Arrowvert", "arrowvert", "ast", "asymp", "atop", "atopwithdelims", "backepsilon", "backprime", "backsim", "backsimeq", "backslash", "bar", "barwedge", "Bbb", "Bbbk", "bbox", "bcancel", "because", "begin", "begingroup", "Beta", "beta", "beth", "between", "bf", "bfseries", "big", "Big", "bigcap", "bigcirc", "bigcup", "bigg", "Bigg", "biggl", "Biggl", "biggm", "Biggm", "biggr", "Biggr", "bigl", "Bigl", "bigm", "Bigm", "bigodot", "bigominus", "bigoplus", "bigoslash", "bigotimes", "bigr", "Bigr", "bigsqcap", "bigsqcup", "bigstar", "bigtriangledown", "bigtriangleup", "biguplus", "bigvee", "bigwedge", "binom", "blacklozenge", "blacksquare", "blacktriangle", "blacktriangledown", "blacktriangleleft", "blacktriangleright", "bm", "bmod", "bold", "boldsymbol", "bot", "bowtie", "Box", "boxdot", "boxed", "boxminus", "boxplus", "boxtimes", "Bra", "bra", "braket", "brace", "bracevert", "brack", "breve", "buildrel", "bull", "bullet", "Bumpeq", "bumpeq", "cal", "cancel", "cancelto", "Cap", "cap", "cases", "cdot", "cdotp", "cdots", "ce", "cee", "centerdot", "cf", "cfrac", "check", "ch", "checkmark", "Chi", "chi", "choose", "circ", "circeq", "circlearrowleft", "circlearrowright", "circledast", "circledcirc", "circleddash", "circledR", "circledS", "class", "cline", "clubs", "clubsuit", "cnums", "colon", "Colonapprox", "colonapprox", "Coloneq", "coloneq", "Coloneqq", "coloneqq", "Colonsim", "colonsim", "color", "colorbox", "complement", "Complex", "cong", "Coppa", "coppa", "coprod", "copyright", "cos", "cosec", "cosh", "cot", "cotg", "coth", "cr", "csc", "cssId", "ctg", "cth", "Cup", "cup", "curlyeqprec", "curlyeqsucc", "curlyvee", "curlywedge", "curvearrowleft", "curvearrowright", "dag", "Dagger", "dagger", "daleth", "Darr", "dArr", "darr", "dashleftarrow", "dashrightarrow", "dashv", "dbinom", "dblcolon", "ddag", "ddagger", "ddddot", "dddot", "ddot", "ddots", "DeclareMathOperator", "def", "definecolor", "deg", "degree", "delta", "Delta", "det", "Digamma", "digamma", "dfrac", "diagdown", "diagup", "Diamond", "diamond", "diamonds", "diamondsuit", "dim", "displaylines", "displaystyle", "div", "divideontimes", "dot", "Doteq", "doteq", "doteqdot", "dotplus", "dots", "dotsb", "dotsc", "dotsi", "dotsm", "dotso", "doublebarwedge", "doublecap", "doublecup", "Downarrow", "downarrow", "downdownarrows", "downharpoonleft", "downharpoonright", "edef", "ell", "else", "em", "emph", "empty", "emptyset", "enclose", "end", "endgroup", "enspace", "Epsilon", "epsilon", "eqalign", "eqalignno", "eqcirc", "Eqcolon", "eqcolon", "Eqqcolon", "eqqcolon", "eqref", "eqsim", "eqslantgtr", "eqslantless", "equiv", "Eta", "eta", "eth", "euro", "exist", "exists", "exp", "expandafter", "fallingdotseq", "fbox", "fcolorbox", "fi", "Finv", "flat", "footnotesize", "forall", "frac", "frak", "frown", "futurelet", "Game", "Gamma", "gamma", "gcd", "gdef", "ge", "geneuro", "geneuronarrow", "geneurowide", "genfrac", "geq", "geqq", "geqslant", "gets", "gg", "ggg", "gggtr", "gimel", "global", "gnapprox", "gneq", "gneqq", "gnsim", "grave", "gt", "gtrdot", "gtrapprox", "gtreqless", "gtreqqless", "gtrless", "gtrsim", "gvertneqq", "Harr", "hArr", "harr", "hat", "hbar", "hbox", "hdashline", "hearts", "heartsuit", "hfil", "hfill", "hline", "hom", "hookleftarrow", "hookrightarrow", "hphantom", "href", "hskip", "hslash", "hspace", "htmlClass", "htmlData", "htmlId", "htmlStyle", "huge", "Huge", "idotsint", "iddots", "if", "iff", "ifmode", "ifx", "iiiint", "iiint", "iint", "Im", "image", "imath", "impliedby", "implies", "in", "includegraphics", "inf", "infin", "infty", "injlim", "int", "intercal", "intop", "Iota", "iota", "isin", "it", "itshape", "jmath", "Join", "Kappa", "kappa", "KaTeX", "ker", "kern", "Ket", "ket", "Koppa", "koppa", "Lambda", "lambda", "label", "land", "lang", "langle", "Larr", "lArr", "larr", "large", "Large", "LARGE", "LaTeX", "lBrace", "lbrace", "lbrack", "lceil", "ldotp", "ldots", "le", "leadsto", "left", "leftarrow", "Leftarrow", "LeftArrow", "leftarrowtail", "leftharpoondown", "leftharpoonup", "leftleftarrows", "Leftrightarrow", "leftrightarrow", "leftrightarrows", "leftrightharpoons", "leftrightsquigarrow", "leftroot", "leftthreetimes", "leq", "leqalignno", "leqq", "leqslant", "lessapprox", "lessdot", "lesseqgtr", "lesseqqgtr", "lessgtr", "lesssim", "let", "lfloor", "lg", "lgroup", "lhd", "lim", "liminf", "limits", "limsup", "ll", "llap", "llbracket", "llcorner", "Lleftarrow", "lll", "llless", "lmoustache", "ln", "lnapprox", "lneq", "lneqq", "lnot", "lnsim", "log", "long", "Longleftarrow", "longleftarrow", "Longleftrightarrow", "longleftrightarrow", "longmapsto", "Longrightarrow", "longrightarrow", "looparrowleft", "looparrowright", "lor", "lower", "lozenge", "lparen", "Lrarr", "lrArr", "lrarr", "lrcorner", "lq", "Lsh", "lt", "ltimes", "lVert", "lvert", "lvertneqq", "maltese", "mapsto", "mathbb", "mathbf", "mathbin", "mathcal", "mathchoice", "mathclap", "mathclose", "mathellipsis", "mathfrak", "mathinner", "mathit", "mathllap", "mathnormal", "mathop", "mathopen", "mathord", "mathpunct", "mathrel", "mathrlap", "mathring", "mathrm", "mathscr", "mathsf", "mathsterling", "mathstrut", "mathtip", "mathtt", "matrix", "max", "mbox", "md", "mdseries", "measuredangle", "medspace", "mho", "mid", "middle", "min", "minuso", "mit", "mkern", "mmlToken", "mod", "models", "moveleft", "moveright", "mp", "mskip", "mspace", "Mu", "mu", "multicolumn", "multimap", "nabla", "natnums", "natural", "negmedspace", "ncong", "ne", "nearrow", "neg", "negthickspace", "negthinspace", "neq", "newcommand", "newenvironment", "Newextarrow", "newline", "nexists", "ngeq", "ngeqq", "ngeqslant", "ngtr", "ni", "nleftarrow", "nLeftarrow", "nLeftrightarrow", "nleftrightarrow", "nleq", "nleqq", "nleqslant", "nless", "nmid", "nobreak", "nobreakspace", "noexpand", "nolimits", "normalfont", "normalsize", "not", "notag", "notin", "notni", "nparallel", "nprec", "npreceq", "nRightarrow", "nrightarrow", "nshortmid", "nshortparallel", "nsim", "nsubseteq", "nsubseteqq", "nsucc", "nsucceq", "nsupseteq", "nsupseteqq", "ntriangleleft", "ntrianglelefteq", "ntriangleright", "ntrianglerighteq", "Nu", "nu", "nVDash", "nVdash", "nvDash", "nvdash", "nwarrow", "odot", "OE", "oe", "officialeuro", "oiiint", "oiint", "oint", "oldstyle", "omega", "Omega", "Omicron", "omicron", "ominus", "operatorname", "operatorname*", "oplus", "or", "oslash", "otimes", "over", "overbrace", "overbracket", "overgroup", "overleftarrow", "overleftharpoon", "overleftrightarrow", "overline", "overlinesegment", "overparen", "Overrightarrow", "overrightarrow", "overrightharpoon", "overset", "overwithdelims", "owns", "pagecolor", "parallel", "part", "partial", "perp", "phantom", "phase", "Phi", "phi", "Pi", "pi", "pitchfork", "plim", "plusmn", "pm", "pmatrix", "pmb", "pmod", "pod", "pounds", "Pr", "prec", "precapprox", "preccurlyeq", "preceq", "precnapprox", "precneqq", "precnsim", "precsim", "prime", "prod", "projlim", "propto", "providecommand", "psi", "Psi", "pu", "qquad", "quad", "raise", "raisebox", "rang", "rangle", "Rarr", "rArr", "rarr", "rBrace", "rbrace", "rbrack", "rceil", "Re", "real", "Reals", "reals", "ref", "relax", "renewcommand", "renewenvironment", "require", "restriction", "rfloor", "rgroup", "rhd", "Rho", "rho", "right", "Rightarrow", "rightarrow", "rightarrowtail", "rightharpoondown", "rightharpoonup", "rightleftarrows", "rightleftharpoons", "rightrightarrows", "rightsquigarrow", "rightthreetimes", "risingdotseq", "rlap", "rm", "rmoustache", "root", "rotatebox", "rparen", "rq", "rrbracket", "Rrightarrow", "Rsh", "rtimes", "Rule", "rule", "rVert", "rvert", "Sampi", "sampi", "sc", "scalebox", "scr", "scriptscriptstyle", "scriptsize", "scriptstyle", "sdot", "searrow", "sec", "sect", "setlength", "setminus", "sf", "sharp", "shortmid", "shortparallel", "shoveleft", "shoveright", "sideset", "Sigma", "sigma", "sim", "simeq", "sin", "sinh", "sixptsize", "sh", "skew", "skip", "sl", "small", "smallfrown", "smallint", "smallsetminus", "smallsmile", "smash", "smile", "smiley", "sout", "Space", "space", "spades", "spadesuit", "sphericalangle", "sqcap", "sqcup", "square", "sqrt", "sqsubset", "sqsubseteq", "sqsupset", "sqsupseteq", "ss", "stackrel", "star", "Stigma", "stigma", "strut", "style", "sub", "sube", "Subset", "subset", "subseteq", "subseteqq", "subsetneq", "subsetneqq", "substack", "succ", "succapprox", "succcurlyeq", "succeq", "succnapprox", "succneqq", "succnsim", "succsim", "sum", "sup", "supe", "Supset", "supset", "supseteq", "supseteqq", "supsetneq", "supsetneqq", "surd", "swarrow", "tag", "tag*", "tan", "tanh", "Tau", "tau", "tbinom", "TeX", "text", "textasciitilde", "textasciicircum", "textbackslash", "textbar", "textbardbl", "textbf", "textbraceleft", "textbraceright", "textcircled", "textcolor", "textdagger", "textdaggerdbl", "textdegree", "textdollar", "textellipsis", "textemdash", "textendash", "textgreater", "textit", "textless", "textmd", "textnormal", "textquotedblleft", "textquotedblright", "textquoteleft", "textquoteright", "textregistered", "textrm", "textsc", "textsf", "textsl", "textsterling", "textstyle", "texttip", "texttt", "textunderscore", "textup", "textvisiblespace", "tfrac", "tg", "th", "therefore", "Theta", "theta", "thetasym", "thickapprox", "thicksim", "thickspace", "thinspace", "tilde", "times", "Tiny", "tiny", "to", "toggle", "top", "triangle", "triangledown", "triangleleft", "trianglelefteq", "triangleq", "triangleright", "trianglerighteq", "tt", "twoheadleftarrow", "twoheadrightarrow", "Uarr", "uArr", "uarr", "ulcorner", "underbrace", "underbracket", "undergroup", "underleftarrow", "underleftrightarrow", "underrightarrow", "underline", "underlinesegment", "underparen", "underrightarrow", "underset", "unicode", "unlhd", "unrhd", "up", "Uparrow", "uparrow", "Updownarrow", "updownarrow", "upharpoonleft", "upharpoonright", "uplus", "uproot", "upshape", "Upsilon", "upsilon", "upuparrows", "urcorner", "url", "utilde", "varcoppa", "varDelta", "varepsilon", "varGamma", "varinjlim", "varkappa", "varLambda", "varliminf", "varlimsup", "varnothing", "varOmega", "varPhi", "varphi", "varPi", "varpi", "varprojlim", "varpropto", "varPsi", "varPsi", "varrho", "varSigma", "varsigma", "varstigma", "varsubsetneq", "varsubsetneqq", "varsupsetneq", "varsupsetneqq", "varTheta", "vartheta", "vartriangle", "vartriangleleft", "vartriangleright", "varUpsilon", "varXi", "vcentcolon", "vcenter", "Vdash", "vDash", "vdash", "vdots", "vec", "vee", "veebar", "verb", "Vert", "vert", "vfil", "vfill", "vline", "vphantom", "Vvdash", "wedge", "weierp", "widecheck", "widehat", "wideparen", "widetilde", "wp", "wr", "xcancel", "xdef", "Xi", "xi", "xhookleftarrow", "xhookrightarrow", "xLeftarrow", "xleftarrow", "xleftharpoondown", "xleftharpoonup", "xLeftrightarrow", "xleftrightarrow", "xleftrightharpoons", "xlongequal", "xmapsto", "xRightarrow", "xrightarrow", "xrightharpoondown", "xrightharpoonup", "xrightleftharpoons", "xtofrom", "xtwoheadleftarrow", "xtwoheadrightarrow", "yen", "Zeta", "zeta"];
//# sourceMappingURL=katex.js.map