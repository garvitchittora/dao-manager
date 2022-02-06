import { AppBar, Box, Container, CssBaseline, ThemeProvider, Toolbar, Typography, Link } from '@material-ui/core';
import Head from 'next/head';
import React from 'react';
import { theme } from '../theme';
import '../../styles/App.css';

export default function MyApp({ Component, pageProps }) {
  React.useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>DAOfront</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <AppBar position="fixed">
          <Toolbar variant="regular">
            <Typography variant="h6">DAOfront</Typography>
            <Link href="https://discord.com/invite/tz76RSDuPF" style={{"color":"white !important", "textAlign": "right", "paddingLeft": "20px"}}>Go to discord</Link>
          </Toolbar>
        </AppBar>

        <CssBaseline />
        <Container>
          <Box marginTop={10}>
            <Component {...pageProps} />
          </Box>
        </Container>
      </ThemeProvider>
    </React.Fragment>
  );
}
