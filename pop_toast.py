with open('src/pages/UserDashboard.tsx', 'r') as f:
    code = f.read()

# Check if useEffect is already showing toast on mount
if 'toast.info(\'Welcome back' not in code:
    code = code.replace(
        "const [theme, setTheme] = useState<'light' | 'dark'>(() => {",
        """
  useEffect(() => {
    // Show some example notifications popping up on initial load
    const timer1 = setTimeout(() => {
      toast.success('TSLA order filled at $180.20', { description: '100 shares bought successfully' });
    }, 1000);
    const timer2 = setTimeout(() => {
      toast.info('Price Alert: NVDA', { description: 'NVIDIA has hit your target of $900.00' });
    }, 2500);
    const timer3 = setTimeout(() => {
      toast.warning('Margin Call Warning', { description: 'Your account margin is approaching limits.' });
    }, 4500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {"""
    )
    with open('src/pages/UserDashboard.tsx', 'w') as f:
        f.write(code)
